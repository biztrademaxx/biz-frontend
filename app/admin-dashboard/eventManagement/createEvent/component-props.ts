import type { EventFormData } from "./types"

export interface FormProgressProps {
  progress: number
}

export interface BasicInfoTabProps {
  formData: EventFormData
  onInputChange: (field: keyof EventFormData, value: any) => void
}

export interface EventDetailsTabProps {
  formData: EventFormData
  onInputChange: (field: keyof EventFormData, value: any) => void
  onArrayChange: (field: keyof EventFormData, index: number, value: string) => void
  onAddArrayItem: (field: keyof EventFormData) => void
  onRemoveArrayItem: (field: keyof EventFormData, index: number) => void
}

export interface PricingTabProps {
  formData: EventFormData
  currencies: string[]
  onFormChange: (updates: Partial<EventFormData>) => void
  onAddCustomSpaceCost: () => void
  onUpdateSpaceCost: (index: number, field: string, value: any) => void
  onRemoveSpaceCost: (index: number) => void
}

export interface MediaTabProps {
  formData: EventFormData
  onInputChange: (field: keyof EventFormData, value: any) => void
}

export interface PreviewTabProps {
  formData: EventFormData
}
