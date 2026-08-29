import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiClock, FiUsers, FiDollarSign, FiCheckCircle, FiAlertCircle, FiCreditCard, FiShield } from 'react-icons/fi';
import { useReducedMotion } from '../../hooks/useAnimations';
import { Venue, BookingFormData } from '../../types';
import { Modal, Button, Input, Select, Textarea } from '../ui';
import { formatCurrency, formatDate, formatTime, generateTimeSlots, getDaysDifference } from '../../utils/helpers';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue | null;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  venue,
  onSuccess,
}) => {
  const reducedMotion = useReducedMotion();
  const { createBooking } = useBookings();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    eventDetails: { eventName: '', eventType: '', expectedGuests: 1, specialRequests: '' },
    dates: { startDate: '', endDate: '', startTime: '18:00', endTime: '23:00' },
    pricing: { basePrice: venue?.pricing.basePrice || 0, total: venue?.pricing.basePrice || 0 },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<{ isAvailable: boolean; blockedDates: string[]; bookedDates: string[] } | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const timeSlots = generateTimeSlots(8, 23, 30);

  useEffect(() => {
    if (venue) {
      setFormData(prev => ({
        ...prev,
        pricing: { basePrice: venue.pricing.basePrice, total: venue.pricing.basePrice },
      }));
    }
  }, [venue]);

  useEffect(() => {
    if (formData.dates.startDate && formData.dates.endDate && venue) {
      checkAvailability();
    }
  }, [formData.dates.startDate, formData.dates.endDate, venue]);

  const checkAvailability = useCallback(async () => {
    if (!venue || !formData.dates.startDate || !formData.dates.endDate) return;
    
    try {
      const response = await fetch(`/api/venues/${venue._id}/availability?startDate=${formData.dates.startDate}&endDate=${formData.dates.endDate}`);
      const data = await response.json();
      if (data.success) {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
    }
  }, [venue, formData.dates.startDate, formData.dates.endDate]);

  const calculateTotal = () => {
    const basePrice = formData.pricing?.basePrice || 0;
    const days = getDaysDifference(formData.dates.startDate, formData.dates.endDate);
    const total = basePrice * Math.max(1, days);
    setFormData(prev => ({ ...prev, pricing: { ...prev.pricing!, total } }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.dates.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.dates.endDate) newErrors.endDate = 'End date is required';
      if (formData.dates.startDate && formData.dates.endDate) {
        const start = new Date(formData.dates.startDate);
        const end = new Date(formData.dates.endDate);
        if (start > end) newErrors.endDate = 'End date must be after start date';
        if (start < new Date(new Date().setHours(0,0,0,0))) newErrors.startDate = 'Start date cannot be in the past';
      }
      if (availability && !availability.isAvailable) newErrors.availability = 'Venue is not available for selected dates';
    }

    if (currentStep === 2) {
      if (!formData.eventDetails?.eventName) newErrors.eventName = 'Event name is required';
      if (!formData.eventDetails?.eventType) newErrors.eventType = 'Event type is required';
      if (!formData.eventDetails?.expectedGuests || formData.eventDetails.expectedGuests < 1) newErrors.expectedGuests = 'Number of guests is required';
      if (formData.eventDetails?.expectedGuests && venue && formData.eventDetails.expectedGuests > venue.capacity.max) {
        newErrors.expectedGuests = `Maximum capacity is ${venue.capacity.max} guests`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !venue || !user) return;

    setIsSubmitting(true);
    try {
      const bookingData: BookingFormData = {
        venue: venue._id,
        eventDetails: formData.eventDetails as BookingFormData['eventDetails'],
        dates: formData.dates as BookingFormData['dates'],
        pricing: formData.pricing as BookingFormData['pricing'],
      };

      const result = await createBooking(bookingData);
      if (result) {
        toast.success('Booking request sent successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateBlocked = (date: Date): boolean => {
    if (!availability) return false;
    const dateStr = date.toISOString().split('T')[0];
    return availability.blockedDates.includes(dateStr) || availability.bookedDates.includes(dateStr);
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDateRange.start) return false;
    const dateStr = date.toISOString().split('T')[0];
    const startStr = selectedDateRange.start.toISOString().split('T')[0];
    const endStr = selectedDateRange.end?.toISOString().split('T')[0] || startStr;
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedDateRange.start || !selectedDateRange.end) return false;
    const dateStr = date.toISOString().split('T')[0];
    const startStr = selectedDateRange.start.toISOString().split('T')[0];
    const endStr = selectedDateRange.end.toISOString().split('T')[0];
    return dateStr > startStr && dateStr < endStr;
  };

  const handleDayClick = (date: Date) => {
    if (isDateBlocked(date)) return;

    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      setSelectedDateRange({ start: date, end: null });
      setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startDate: date.toISOString().split('T')[0], endDate: '' } }));
    } else if (date < selectedDateRange.start) {
      setSelectedDateRange({ start: date, end: selectedDateRange.start });
      setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startDate: date.toISOString().split('T')[0], endDate: selectedDateRange.start!.toISOString().split('T')[0] } }));
    } else {
      setSelectedDateRange({ start: selectedDateRange.start, end: date });
      setFormData(prev => ({ ...prev, dates: { ...prev.dates!, endDate: date.toISOString().split('T')[0] } }));
    }
    calculateTotal();
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = formData.dates.startDate ? new Date(formData.dates.startDate) : today;
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    const weeks = [];
    let day = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDay) {
          week.push({ day: prevMonthLastDay - startDay + j + 1, isCurrentMonth: false, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - startDay + j + 1) });
        } else if (day <= daysInMonth) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          week.push({ day: day++, isCurrentMonth: true, date });
        } else {
          week.push({ day: nextMonthDay++, isCurrentMonth: false, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, nextMonthDay - 1) });
        }
      }
      weeks.push(week);
      if (day > daysInMonth && nextMonthDay > 7) break;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startDate: newMonth.toISOString().split('T')[0] } }));
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="font-semibold text-gray-900">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button
            onClick={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startDate: newMonth.toISOString().split('T')[0] } }));
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) => (
            <motion.div
              key={weekIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : weekIndex * 0.05, duration: 0.2 }}
              className="contents"
            >
              {week.map(({ day, isCurrentMonth, date }, dayIndex) => (
                <motion.button
                  key={dayIndex}
                  onClick={() => isCurrentMonth && !isDateBlocked(date) && handleDayClick(date)}
                  disabled={!isCurrentMonth || isDateBlocked(date) || date < new Date(new Date().setHours(0,0,0,0))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isDateBlocked(date) || date < new Date(new Date().setHours(0,0,0,0)) ? 'text-gray-300 line-through cursor-not-allowed' : ''}
                    ${isDateSelected(date) ? 'bg-primary-600 text-white' : ''}
                    ${isDateInRange(date) ? 'bg-primary-100 text-primary-700' : ''}
                    ${date.toDateString() === today.toDateString() && !isDateSelected(date) ? 'ring-2 ring-primary-500' : ''}
                    hover:!isCurrentMonth:!isDateBlocked:!date < new Date: bg-gray-100
                  `}
                  aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}${isDateBlocked(date) ? ', not available' : ''}${isDateSelected(date) ? ', selected' : ''}`}
                >
                  {day}
                </motion.button>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary-600" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary-100 border border-primary-300" />
            <span>In Range</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gray-300 line-through" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    );
  };

  const steps = [
    { number: 1, label: 'Dates & Time' },
    { number: 2, label: 'Event Details' },
    { number: 3, label: 'Confirm & Pay' },
  ];

  if (!venue) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Venue"
      size="xl"
      footer={
        <div className="flex justify-between w-full">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          <div className="flex-1 flex justify-end gap-3">
            {step < 3 ? (
              <Button variant="primary" onClick={handleNext} disabled={isSubmitting} rightIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} leftIcon={<FiCheckCircle className="w-4 h-4" />}>
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{venue.name}</h3>
            <p className="text-sm text-gray-500">{venue.location.city}, {venue.location.state}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(venue.pricing.basePrice)}</p>
            <p className="text-sm text-gray-500">/{venue.pricing.priceType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.1, type: 'spring', stiffness: 200 }}
                className={`flex items-center gap-2 ${index === step - 1 ? 'text-primary-600' : 'text-gray-400'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${index < step - 1 ? 'bg-primary-600 text-white' : index === step - 1 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}
                `}>
                  {index < step - 1 ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    s.number
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s.label}</span>
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: reducedMotion ? 0 : index * 0.1 + 0.1, duration: 0.3 }}
                  className={`h-1 rounded-full flex-1 max-w-xs ${index < step - 1 ? 'bg-primary-500' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <label className="label">Select Dates</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Check-in"
                  type="date"
                  value={formData.dates?.startDate || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startDate: newDate } }));
                    if (formData.dates?.endDate && newDate > formData.dates.endDate) {
                      setFormData(prev => ({ ...prev, dates: { ...prev.dates!, endDate: newDate } }));
                    }
                    if (!selectedDateRange.start || new Date(newDate) < selectedDateRange.start) {
                      setSelectedDateRange(prev => ({ ...prev, start: new Date(newDate) }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.startDate}
                  leftIcon={<FiCalendar className="w-5 h-5" />}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={formData.dates?.endDate || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData(prev => ({ ...prev, dates: { ...prev.dates!, endDate: newDate } }));
                    setSelectedDateRange(prev => ({ ...prev, end: newDate ? new Date(newDate) : null }));
                  }}
                  min={formData.dates?.startDate || new Date().toISOString().split('T')[0]}
                  error={errors.endDate}
                  leftIcon={<FiCalendar className="w-5 h-5" />}
                />
              </div>
              {errors.availability && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.availability}
                </motion.p>
              )}
            </div>

            <div>
              <label className="label">Calendar View</label>
              {renderCalendar()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Start Time"
                value={formData.dates?.startTime || '18:00'}
                onChange={(e) => setFormData(prev => ({ ...prev, dates: { ...prev.dates!, startTime: e.target.value } }))}
                options={timeSlots.map(t => ({ value: t, label: formatTime(t) }))}
                leftIcon={<FiClock className="w-5 h-5" />}
              />
              <Select
                label="End Time"
                value={formData.dates?.endTime || '23:00'}
                onChange={(e) => setFormData(prev => ({ ...prev, dates: { ...prev.dates!, endTime: e.target.value } }))}
                options={timeSlots.map(t => ({ value: t, label: formatTime(t) }))}
                leftIcon={<FiClock className="w-5 h-5" />}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <label className="label">Event Name</label>
              <Input
                placeholder="e.g., Sarah & John's Wedding"
                value={formData.eventDetails?.eventName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDetails: { ...prev.eventDetails!, eventName: e.target.value } }))}
                error={errors.eventName}
              />
            </div>

            <Select
              label="Event Type"
              value={formData.eventDetails?.eventType || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDetails: { ...prev.eventDetails!, eventType: e.target.value } }))}
              options={[
                { value: 'wedding', label: 'Wedding' },
                { value: 'birthday', label: 'Birthday Party' },
                { value: 'corporate', label: 'Corporate Event' },
                { value: 'anniversary', label: 'Anniversary' },
                { value: 'graduation', label: 'Graduation' },
                { value: 'baby_shower', label: 'Baby Shower' },
                { value: 'holiday', label: 'Holiday Party' },
                { value: 'charity', label: 'Charity/Fundraiser' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select event type"
              error={errors.eventType}
            />

            <Input
              label="Number of Guests"
              type="number"
              min="1"
              max={venue.capacity.max}
              value={formData.eventDetails?.expectedGuests || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDetails: { ...prev.eventDetails!, expectedGuests: parseInt(e.target.value) || 1 } }))}
              error={errors.expectedGuests}
              helperText={`Maximum capacity: ${venue.capacity.max} guests`}
              leftIcon={<FiUsers className="w-5 h-5" />}
            />

            <Textarea
              label="Special Requests (Optional)"
              placeholder="Any special requirements, dietary restrictions, decoration preferences, etc."
              value={formData.eventDetails?.specialRequests || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDetails: { ...prev.eventDetails!, specialRequests: e.target.value } }))}
              rows={3}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5 text-primary-600" />
                Price Summary
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price ({venue.pricing.priceType})</span>
                  <span className="font-medium text-gray-900">{formatCurrency(venue.pricing.basePrice)}</span>
                </div>
                
                {formData.dates?.startDate && formData.dates?.endDate && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Duration</span>
                      <span className="font-medium text-gray-900">{getDaysDifference(formData.dates.startDate, formData.dates.endDate)} day(s)</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">{formatCurrency(formData.pricing?.total || 0)}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-primary-600">{formatCurrency(formData.pricing?.total || venue.pricing.basePrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiShield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">Booking Protection</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Free cancellation up to 48 hours before event. Secure payment processing.
                  </p>
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-primary-800">Sign in required</h4>
                    <p className="text-sm text-primary-700 mt-1">
                      You'll need to create an account or sign in to complete your booking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>, 
                <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>, and 
                <a href="/cancellation-policy" className="text-primary-600 hover:underline">Cancellation Policy</a>
              </label>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};