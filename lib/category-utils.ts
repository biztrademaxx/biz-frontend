import { prisma } from "@/lib/prisma"

export async function getCategoryWithEventCount(categoryId: string) {
  const category = await prisma.eventCategory.findUnique({
    where: { id: categoryId }
  })

  if (!category) {
    return null
  }

  const eventCount = await prisma.eventsOnCategories.count({
    where: {
      categoryId: categoryId
    }
  })

  return {
    ...category,
    eventCount
  }
}

export async function getAllCategoriesWithEventCounts() {
  const categories = await prisma.eventCategory.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const eventCount = await prisma.eventsOnCategories.count({
        where: {
          categoryId: category.id
        }
      })
      
      return {
        ...category,
        eventCount
      }
    })
  )

  return categoriesWithCounts
}