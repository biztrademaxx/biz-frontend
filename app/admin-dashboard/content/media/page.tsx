import CmsItemsPage from "../CmsItemsPage"

export default function MediaLibraryPage() {
  return (
    <CmsItemsPage
      type="MEDIA"
      heading="Media Library"
      description="Register uploaded assets by URL (use Admin Upload, then paste secure_url)."
    />
  )
}
