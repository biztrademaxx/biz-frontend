import { fetchBrowseCategoriesForHomeServer } from "@/lib/categories/fetch-browse-categories-server"
import CategoryGridClient from "./CategoryGridClient"

export default async function CategoryGridSection() {
  const categories = await fetchBrowseCategoriesForHomeServer()
  return <CategoryGridClient categories={categories} />
}
