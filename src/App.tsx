import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { LandingPage } from '@/pages/LandingPage'
import { TemplateGalleryPage } from '@/pages/TemplateGalleryPage'
import { TemplatePreviewPage } from '@/pages/TemplatePreviewPage'
import { InvitationPreviewPage } from '@/pages/InvitationPreviewPage'
import { PricingPage } from '@/pages/PricingPage'
import { PrivacyPage } from '@/pages/legal/PrivacyPage'
import { TermsPage } from '@/pages/legal/TermsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Pages most visitors never open are loaded only when needed, so the first
// page (usually a guest's invitation) downloads less code.
const EntranceLabPage = lazy(() => import('@/pages/EntranceLabPage').then((m) => ({ default: m.EntranceLabPage })))
const SamplePage = lazy(() => import('@/pages/SamplePage').then((m) => ({ default: m.SamplePage })))
const AlbumPage = lazy(() => import('@/pages/AlbumPage').then((m) => ({ default: m.AlbumPage })))
const DashboardAlbumPage = lazy(() => import('@/pages/dashboard/DashboardAlbumPage').then((m) => ({ default: m.DashboardAlbumPage })))
const AdminPage = lazy(() => import('@/pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })))
const DashboardInviteesPage = lazy(() => import('@/pages/dashboard/DashboardInviteesPage').then((m) => ({ default: m.DashboardInviteesPage })))
const SignInPage = lazy(() => import('@/pages/SignInPage').then((m) => ({ default: m.SignInPage })))
const PublishSuccessPage = lazy(() => import('@/pages/PublishSuccessPage').then((m) => ({ default: m.PublishSuccessPage })))
const CreateLayout = lazy(() => import('@/pages/create/CreateLayout').then((m) => ({ default: m.CreateLayout })))
const StepTemplate = lazy(() => import('@/pages/create/StepTemplate').then((m) => ({ default: m.StepTemplate })))
const StepCouple = lazy(() => import('@/pages/create/StepCouple').then((m) => ({ default: m.StepCouple })))
const StepCeremonies = lazy(() => import('@/pages/create/StepCeremonies').then((m) => ({ default: m.StepCeremonies })))
const StepStory = lazy(() => import('@/pages/create/StepStory').then((m) => ({ default: m.StepStory })))
const StepPhotos = lazy(() => import('@/pages/create/StepPhotos').then((m) => ({ default: m.StepPhotos })))
const StepOptions = lazy(() => import('@/pages/create/StepOptions').then((m) => ({ default: m.StepOptions })))
const StepPreview = lazy(() => import('@/pages/create/StepPreview').then((m) => ({ default: m.StepPreview })))
const DashboardLayout = lazy(() => import('@/components/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })))
const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage })))
const DashboardEventsPage = lazy(() => import('@/pages/dashboard/DashboardEventsPage').then((m) => ({ default: m.DashboardEventsPage })))
const DashboardEventDetailPage = lazy(() => import('@/pages/dashboard/DashboardEventDetailPage').then((m) => ({ default: m.DashboardEventDetailPage })))
const DashboardEditCeremonyPage = lazy(() => import('@/pages/dashboard/DashboardEditCeremonyPage').then((m) => ({ default: m.DashboardEditCeremonyPage })))
const DashboardGuestsPage = lazy(() => import('@/pages/dashboard/DashboardGuestsPage').then((m) => ({ default: m.DashboardGuestsPage })))
const DashboardSettingsPage = lazy(() => import('@/pages/dashboard/DashboardSettingsPage').then((m) => ({ default: m.DashboardSettingsPage })))

function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<TemplateGalleryPage />} />
        <Route path="/templates/:templateId" element={<TemplatePreviewPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/invitation/:slug" element={<InvitationPreviewPage />} />
        <Route path="/success/:slug" element={<PublishSuccessPage />} />
      </Route>

      <Route path="/album/:slug" element={<AlbumPage />} />
      <Route path="/sample/:templateId" element={<SamplePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/entrance-lab" element={<EntranceLabPage />} />

      <Route path="/create" element={<CreateLayout />}>
        <Route index element={<StepTemplate />} />
        <Route path="couple" element={<StepCouple />} />
        <Route path="ceremonies" element={<StepCeremonies />} />
        <Route path="story" element={<StepStory />} />
        <Route path="photos" element={<StepPhotos />} />
        <Route path="options" element={<StepOptions />} />
        <Route path="preview" element={<StepPreview />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="events" element={<DashboardEventsPage />} />
          <Route path="events/:eventId" element={<DashboardEventDetailPage />} />
          <Route path="events/:eventId/guests" element={<DashboardGuestsPage />} />
          <Route path="ceremonies/:ceremonyId/edit" element={<DashboardEditCeremonyPage />} />
          <Route path="weddings/:weddingId/guests" element={<DashboardGuestsPage />} />
          <Route path="events/:eventId/invitees" element={<DashboardInviteesPage />} />
          <Route path="events/:eventId/album" element={<DashboardAlbumPage />} />
          <Route path="events/:eventId/settings" element={<DashboardSettingsPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}

export default App