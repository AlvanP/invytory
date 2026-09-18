import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { TemplateGalleryPage } from '@/pages/TemplateGalleryPage'
import { TemplatePreviewPage } from '@/pages/TemplatePreviewPage'
import { InvitationPreviewPage } from '@/pages/InvitationPreviewPage'
import { PricingPage } from '@/pages/PricingPage'
import { PublishSuccessPage } from '@/pages/PublishSuccessPage'
import { SignInPage } from '@/pages/SignInPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CreateLayout } from '@/pages/create/CreateLayout'
import { StepTemplate } from '@/pages/create/StepTemplate'
import { StepCouple } from '@/pages/create/StepCouple'
import { StepEvent } from '@/pages/create/StepEvent'
import { StepStory } from '@/pages/create/StepStory'
import { StepPhotos } from '@/pages/create/StepPhotos'
import { StepOptions } from '@/pages/create/StepOptions'
import { StepPreview } from '@/pages/create/StepPreview'
import { DashboardOverviewPage } from '@/pages/dashboard/DashboardOverviewPage'
import { DashboardEventsPage } from '@/pages/dashboard/DashboardEventsPage'
import { DashboardEventDetailPage } from '@/pages/dashboard/DashboardEventDetailPage'
import { DashboardGuestsPage } from '@/pages/dashboard/DashboardGuestsPage'
import { DashboardSettingsPage } from '@/pages/dashboard/DashboardSettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<TemplateGalleryPage />} />
        <Route path="/templates/:templateId" element={<TemplatePreviewPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/invitation/:slug" element={<InvitationPreviewPage />} />
        <Route path="/success/:slug" element={<PublishSuccessPage />} />
      </Route>

      <Route path="/sign-in" element={<SignInPage />} />

      <Route path="/create" element={<CreateLayout />}>
        <Route index element={<StepTemplate />} />
        <Route path="couple" element={<StepCouple />} />
        <Route path="event" element={<StepEvent />} />
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
          <Route path="events/:eventId/settings" element={<DashboardSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App