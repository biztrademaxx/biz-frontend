"use client"

import { useEvents } from "./hooks/useEvents"
import { EventTable } from "./components/EventTable"
import { VerifyEventDialog } from "./components/VerifyEventDialog"
import { EditEventForm } from "../event-management"

export default function EventManagementPage() {
  const {
    events,
    categories,
    loading,
    categoriesLoading,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
    eventCounts,
    mailCandidates,
    sendingMail,
    selectedEvent,
    isEditing,
    isVerifyDialogOpen,
    setIsVerifyDialogOpen,
    verifying,
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
  } = useEvents()

  if (loading || categoriesLoading) {
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
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        activeTab={activeTab}
        eventCounts={eventCounts}
        categories={categories}
        onEdit={handleEditEvent}
        onStatusChange={handleStatusChange}
        onFeatureToggle={handleFeatureToggle}
        onVipToggle={handleVipToggle}
        onPublicToggle={handlePublicToggle}
        onDelete={handleDeleteEvent}
        onPromote={() => {}}
        onVerify={handleVerifyEvent}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setSelectedStatus}
        onCategoryFilterChange={setSelectedCategory}
        onTabChange={setActiveTab}
        mailCandidates={mailCandidates}
        sendingMail={sendingMail}
        onSendListingEmail={handleSendListingEmail}
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
