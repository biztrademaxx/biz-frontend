import { Suspense } from "react"
import CategoryGridClient from "@/components/category-grid/CategoryGridClient"
import { CategoryBrowseSkeleton } from "@/components/home-skeletons"
import { fetchBrowseCategoriesForHomeServer } from "@/lib/categories/fetch-browse-categories-server"

export const metadata = {
  title: "Browse by category",
  description: "Explore events by industry and topic.",
}

async function CategoriesGrid() {
  const categories = await fetchBrowseCategoriesForHomeServer()
  return <CategoryGridClient categories={categories} variant="full" />
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white">
      <Suspense fallback={<CategoryBrowseSkeleton />}>
        <CategoriesGrid />
      </Suspense>
    </div>
  )
}
