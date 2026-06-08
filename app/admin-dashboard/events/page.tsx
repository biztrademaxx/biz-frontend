"use client"

import { useEvents } from "./hooks/useEvents"
import { EventTable } from "./components/EventTable"
import { VerifyEventDialog } from "./components/VerifyEventDialog"
import { EditEventForm } from "./components/EditEventForm"
import type { Event } from "./types/event.types"

interface EventManagementPageProps {
  onPromote?: (event: Event) => void
}

export default function EventManagementPage({ onPromote }: EventManagementPageProps = {}) {
  const {
    events,
    categories,
    countries,
    loading,
    categoriesLoading,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedCountry,
    setSelectedCountry,
    activeTab,
    setActiveTab,
    page,
    pagination,
    eventCounts,
    mailCandidates,
    sendingMail,
    sendingMailFor,
    selectedEvent,
    isEditing,
    isVerifyDialogOpen,
    setIsVerifyDialogOpen,
    verifying,
    handlePageChange,
    handleStatusChange,
    handleFeatureToggle,
    handleVipToggle,
    handlePublicToggle,
    handleVerifyToggle,
    handleDeleteEvent,
    handleEditEvent,
    handleSaveEvent,
    handleCancelEdit,
    handleVerifyEvent,
    handleSendListingEmail,
    handleSendListingEmailBulk,
  } = useEvents()

  if (categoriesLoading && events.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500">Loading events...</p>
      </div>
    )
  }

  if (isEditing && selectedEvent) {
    return (
      <EditEventForm
        event={selectedEvent}
        onSave={handleSaveEvent}
        onCancel={handleCancelEdit}
        categories={categories}
      />
    )
  }

  return (
    <>
      <EventTable
        events={events}
        loading={loading}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        activeTab={activeTab}
        page={page}
        pagination={pagination}
        onPageChange={handlePageChange}
        eventCounts={eventCounts}
        categories={categories}
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryFilterChange={setSelectedCountry}
        onEdit={handleEditEvent}
        onStatusChange={handleStatusChange}
        onFeatureToggle={handleFeatureToggle}
        onVipToggle={handleVipToggle}
        onPublicToggle={handlePublicToggle}
        onDelete={handleDeleteEvent}
        onPromote={onPromote ?? (() => {})}
        onVerify={handleVerifyEvent}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setSelectedStatus}
        onCategoryFilterChange={setSelectedCategory}
        onTabChange={setActiveTab}
        mailCandidates={mailCandidates}
        sendingMail={sendingMail}
        sendingMailFor={sendingMailFor}
        onSendListingEmail={handleSendListingEmail}
        onSendListingEmailBulk={handleSendListingEmailBulk}
      />
      <VerifyEventDialog
        event={selectedEvent}
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        onVerify={(verify, customBadge) =>
          selectedEvent && handleVerifyToggle(selectedEvent, verify, customBadge)
        }
        loading={verifying}
      />
    </>
  )
}
