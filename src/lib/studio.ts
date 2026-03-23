import { apiFetch } from './api';
import type {
  Course, CourseModule, CourseLesson, Enrollment, MediaItem, Review,
  F2FPricing, F2FSlot, F2FBooking, Coupon, MentorPayout,
  Announcement, StudioDashboardKPIs,
  CreateCourseData, UpdateCourseData, CreateModuleData, CreateLessonData,
  CreateMediaData, UpdateMediaData, CreateF2FPricingData, CreateF2FSlotData,
  CreateCouponData, CreateAnnouncementData, FinanceOverview,
  MentorProfile, UpdateMentorProfileData,
} from '@/types/studio';
import {
  DEMO_KPIS, DEMO_ACTIVITY, DEMO_COURSES, DEMO_ENROLLMENTS,
  DEMO_MEDIA, DEMO_FINANCE, DEMO_COUPONS, DEMO_PAYOUTS,
  DEMO_MENTOR_PROFILE, DEMO_REVIEWS, DEMO_F2F_PRICINGS,
  DEMO_F2F_SLOTS, DEMO_F2F_BOOKINGS, DEMO_ANNOUNCEMENTS,
} from './studio-demo';

// ── Demo-Modus ─────────────────────────────────────────────
// Wenn die API nicht erreichbar ist, werden Demo-Daten angezeigt.
// So koennen alle Screens ohne laufendes Backend getestet werden.

const IS_DEV = process.env.NODE_ENV === 'development';

async function withDemo<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    if (IS_DEV) return fallback;
    throw new Error('API nicht erreichbar');
  }
}

// ── Dashboard ──────────────────────────────────────────────
export async function fetchDashboardKPIs(): Promise<StudioDashboardKPIs> {
  return withDemo(() => apiFetch('/studio/dashboard/kpis'), DEMO_KPIS);
}

export async function fetchRecentActivity(limit = 10) {
  return withDemo(
    () => apiFetch(`/studio/dashboard/activity?limit=${limit}`),
    DEMO_ACTIVITY.slice(0, limit),
  );
}

// ── Kurse ──────────────────────────────────────────────────
export async function fetchCourses(options?: { status?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  const filtered = options?.status
    ? DEMO_COURSES.filter((c) => c.status === options.status)
    : DEMO_COURSES;

  return withDemo(
    () => apiFetch<{ data: Course[]; total: number; hasMore: boolean }>(`/studio/courses${qs ? `?${qs}` : ''}`),
    { data: filtered, total: filtered.length, hasMore: false },
  );
}

export async function fetchCourse(id: string): Promise<Course> {
  const demo = DEMO_COURSES.find((c) => c.id === id) ?? DEMO_COURSES[0];
  return withDemo(() => apiFetch(`/studio/courses/${id}`), demo);
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  return apiFetch('/studio/courses', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  return apiFetch(`/studio/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCourse(id: string): Promise<void> {
  await apiFetch(`/studio/courses/${id}`, { method: 'DELETE' });
}

// ── Module ─────────────────────────────────────────────────
export async function fetchModules(courseId: string): Promise<CourseModule[]> {
  const demo = DEMO_COURSES.find((c) => c.id === courseId)?.modules ?? [];
  return withDemo(() => apiFetch(`/studio/courses/${courseId}/modules`), demo);
}

export async function createModule(courseId: string, data: CreateModuleData): Promise<CourseModule> {
  return apiFetch(`/studio/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateModule(moduleId: string, data: Partial<CreateModuleData>): Promise<CourseModule> {
  return apiFetch(`/studio/courses/modules/${moduleId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteModule(moduleId: string): Promise<void> {
  await apiFetch(`/studio/courses/modules/${moduleId}`, { method: 'DELETE' });
}

// ── Lektionen ──────────────────────────────────────────────
export async function createLesson(moduleId: string, data: CreateLessonData): Promise<CourseLesson> {
  return apiFetch(`/studio/courses/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateLesson(lessonId: string, data: Partial<CreateLessonData>): Promise<CourseLesson> {
  return apiFetch(`/studio/courses/lessons/${lessonId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await apiFetch(`/studio/courses/lessons/${lessonId}`, { method: 'DELETE' });
}

// ── Enrollments ────────────────────────────────────────────
export async function fetchEnrollments(courseId: string, options?: { status?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  const demo = DEMO_ENROLLMENTS[courseId] ?? [];

  return withDemo(
    () => apiFetch<{ data: Enrollment[]; total: number; hasMore: boolean }>(
      `/studio/courses/${courseId}/enrollments${qs ? `?${qs}` : ''}`,
    ),
    { data: demo, total: demo.length, hasMore: false },
  );
}

// ── Mediathek ──────────────────────────────────────────────
export async function fetchMediaItems(options?: { content_type?: string; tags?: string[]; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.content_type) params.set('content_type', options.content_type);
  if (options?.tags?.length) params.set('tags', options.tags.join(','));
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  const filtered = options?.content_type
    ? DEMO_MEDIA.filter((m) => m.content_type === options.content_type)
    : DEMO_MEDIA;

  return withDemo(
    () => apiFetch<{ data: MediaItem[]; total: number; hasMore: boolean }>(`/studio/media${qs ? `?${qs}` : ''}`),
    { data: filtered, total: filtered.length, hasMore: false },
  );
}

export async function fetchMediaItem(id: string): Promise<MediaItem> {
  const demo = DEMO_MEDIA.find((m) => m.id === id) ?? DEMO_MEDIA[0];
  return withDemo(() => apiFetch(`/studio/media/${id}`), demo);
}

export async function createMediaItem(data: CreateMediaData): Promise<MediaItem> {
  return apiFetch('/studio/media', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMediaItem(id: string, data: UpdateMediaData): Promise<MediaItem> {
  return apiFetch(`/studio/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteMediaItem(id: string): Promise<void> {
  await apiFetch(`/studio/media/${id}`, { method: 'DELETE' });
}

// ── Bewertungen ────────────────────────────────────────────
export async function fetchReviews(options?: { target_type?: string; pending_reply?: boolean; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.target_type) params.set('target_type', options.target_type);
  if (options?.pending_reply) params.set('pending_reply', 'true');
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();

  return withDemo(
    () => apiFetch<{ data: Review[]; total: number; hasMore: boolean }>(`/studio/reviews${qs ? `?${qs}` : ''}`),
    { data: DEMO_REVIEWS, total: DEMO_REVIEWS.length, hasMore: false },
  );
}

export async function replyToReview(id: string, replyText: string): Promise<Review> {
  return apiFetch(`/studio/reviews/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply_text: replyText }) });
}

// ── Face2Face ──────────────────────────────────────────────
export async function fetchF2FPricings(): Promise<F2FPricing[]> {
  return withDemo(() => apiFetch('/studio/f2f/pricing'), DEMO_F2F_PRICINGS);
}

export async function createF2FPricing(data: CreateF2FPricingData): Promise<F2FPricing> {
  return apiFetch('/studio/f2f/pricing', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteF2FPricing(id: string): Promise<void> {
  await apiFetch(`/studio/f2f/pricing/${id}`, { method: 'DELETE' });
}

export async function fetchF2FSlots(options?: { from_date?: string; to_date?: string; status?: string }): Promise<F2FSlot[]> {
  const params = new URLSearchParams();
  if (options?.from_date) params.set('from_date', options.from_date);
  if (options?.to_date) params.set('to_date', options.to_date);
  if (options?.status) params.set('status', options.status);
  const qs = params.toString();
  return withDemo(() => apiFetch(`/studio/f2f/slots${qs ? `?${qs}` : ''}`), DEMO_F2F_SLOTS);
}

export async function createF2FSlot(data: CreateF2FSlotData): Promise<F2FSlot> {
  return apiFetch('/studio/f2f/slots', { method: 'POST', body: JSON.stringify(data) });
}

export async function createF2FSlotsBulk(data: CreateF2FSlotData[]): Promise<F2FSlot[]> {
  return apiFetch('/studio/f2f/slots/bulk', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteF2FSlot(id: string): Promise<void> {
  await apiFetch(`/studio/f2f/slots/${id}`, { method: 'DELETE' });
}

export async function fetchF2FBookings(options?: { status?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return withDemo(
    () => apiFetch<{ data: F2FBooking[]; total: number; hasMore: boolean }>(`/studio/f2f/bookings${qs ? `?${qs}` : ''}`),
    { data: DEMO_F2F_BOOKINGS, total: DEMO_F2F_BOOKINGS.length, hasMore: false },
  );
}

export async function updateBookingStatus(id: string, status: string): Promise<F2FBooking> {
  return apiFetch(`/studio/f2f/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function createF2FSession(data: {
  client_id: string;
  starts_at: string;
  duration_minutes: number;
  price_cents: number;
  topic?: string;
}): Promise<F2FBooking> {
  return apiFetch('/studio/f2f/sessions', { method: 'POST', body: JSON.stringify(data) });
}

export async function startF2FCall(bookingId: string): Promise<F2FBooking> {
  return apiFetch(`/studio/f2f/bookings/${bookingId}/start-call`, { method: 'POST' });
}

export async function completeF2FBooking(bookingId: string, rating?: number, comment?: string): Promise<F2FBooking> {
  return apiFetch(`/studio/f2f/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ rating, comment }) });
}

// ── Client F2F Buchung (oeffentlich) ──────────────────────
export async function fetchMentorPricing(mentorId: string): Promise<F2FPricing[]> {
  return apiFetch(`/f2f/mentors/${mentorId}/pricing`);
}

export async function fetchMentorSlots(mentorId: string, fromDate?: string): Promise<F2FSlot[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  const qs = params.toString();
  return apiFetch(`/f2f/mentors/${mentorId}/slots${qs ? `?${qs}` : ''}`);
}

export async function bookF2FSlot(slotId: string, pricingId: string, topic?: string): Promise<F2FBooking> {
  return apiFetch('/f2f/book', { method: 'POST', body: JSON.stringify({ slot_id: slotId, pricing_id: pricingId, topic }) });
}

export async function fetchMyF2FBookings(options?: { status?: string; page?: number }): Promise<{ data: F2FBooking[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  const qs = params.toString();
  return apiFetch(`/f2f/my-bookings${qs ? `?${qs}` : ''}`);
}

// ── Finanzen ───────────────────────────────────────────────
export async function fetchFinanceOverview(): Promise<FinanceOverview> {
  return withDemo(() => apiFetch('/studio/finance/overview'), DEMO_FINANCE);
}

export async function fetchPayouts(options?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return withDemo(
    () => apiFetch<{ data: MentorPayout[]; total: number; hasMore: boolean }>(`/studio/finance/payouts${qs ? `?${qs}` : ''}`),
    { data: DEMO_PAYOUTS, total: DEMO_PAYOUTS.length, hasMore: false },
  );
}

export async function fetchCoupons(): Promise<Coupon[]> {
  return withDemo(() => apiFetch('/studio/finance/coupons'), DEMO_COUPONS);
}

export async function createCoupon(data: CreateCouponData): Promise<Coupon> {
  return apiFetch('/studio/finance/coupons', { method: 'POST', body: JSON.stringify(data) });
}

export async function toggleCoupon(id: string): Promise<Coupon> {
  return apiFetch(`/studio/finance/coupons/${id}/toggle`, { method: 'PATCH' });
}

export async function deleteCoupon(id: string): Promise<void> {
  await apiFetch(`/studio/finance/coupons/${id}`, { method: 'DELETE' });
}

// ── Ankuendigungen ─────────────────────────────────────────
export async function fetchAnnouncements(options?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return withDemo(
    () => apiFetch<{ data: Announcement[]; total: number; hasMore: boolean }>(`/studio/announcements${qs ? `?${qs}` : ''}`),
    { data: DEMO_ANNOUNCEMENTS, total: DEMO_ANNOUNCEMENTS.length, hasMore: false },
  );
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  return apiFetch('/studio/announcements', { method: 'POST', body: JSON.stringify(data) });
}

// ── Mentor-Profil ─────────────────────────────────────────
export async function fetchMentorProfile(): Promise<MentorProfile> {
  return withDemo(() => apiFetch('/studio/profile'), DEMO_MENTOR_PROFILE);
}

export async function updateMentorProfile(data: UpdateMentorProfileData): Promise<MentorProfile> {
  return apiFetch('/studio/profile', { method: 'PATCH', body: JSON.stringify(data) });
}
