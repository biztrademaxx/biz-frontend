import { NextResponse } from "next/server"

export async function GET() {
  try {
    // UI-only mock stats — real counts would come from GET /api/admin/dashboard on the Express backend
    const userCount = 0
    const eventCount = 0
    const paymentCount = 0

    // Mock backup data - in production, this would come from a backup service
    const backups = [
      {
        id: "backup_1",
        name: "Full Backup - Dec 2024",
        type: "full",
        status: "completed",
        size: "2.4 GB",
        sizeBytes: 2576980378,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        duration: "32 min",
        storage: "both",
        encryption: true,
        collections: [],
        retentionDays: 30,
      },
      {
        id: "backup_2",
        name: "Incremental Backup",
        type: "incremental",
        status: "completed",
        size: "156 MB",
        sizeBytes: 163577856,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
        duration: "8 min",
        storage: "cloud",
        encryption: true,
        collections: ["users", "events", "payments"],
        retentionDays: 14,
      },
      {
        id: "backup_3",
        name: "Weekly Full Backup",
        type: "full",
        status: "completed",
        size: "2.3 GB",
        sizeBytes: 2469606195,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        duration: "30 min",
        storage: "both",
        encryption: true,
        collections: [],
        retentionDays: 90,
      },
      {
        id: "backup_4",
        name: "Pre-migration Backup",
        type: "full",
        status: "completed",
        size: "2.1 GB",
        sizeBytes: 2254857830,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000).toISOString(),
        duration: "28 min",
        storage: "local",
        encryption: true,
        collections: [],
        retentionDays: 365,
      },
    ]

    const schedules = [
      {
        id: "schedule_1",
        name: "Daily Full Backup",
        type: "full",
        frequency: "daily",
        time: "02:00",
        enabled: true,
        lastRun: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        retention: 30,
        storage: "both",
      },
      {
        id: "schedule_2",
        name: "Hourly Incremental",
        type: "incremental",
        frequency: "hourly",
        time: "00:00",
        enabled: true,
        lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        retention: 7,
        storage: "cloud",
      },
      {
        id: "schedule_3",
        name: "Weekly Archive",
        type: "full",
        frequency: "weekly",
        time: "03:00",
        dayOfWeek: 0,
        enabled: true,
        lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        retention: 90,
        storage: "both",
      },
      {
        id: "schedule_4",
        name: "Monthly Long-term",
        type: "full",
        frequency: "monthly",
        time: "04:00",
        dayOfMonth: 1,
        enabled: false,
        lastRun: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        retention: 365,
        storage: "cloud",
      },
    ]

    const storageLocations = [
      {
        id: "storage_1",
        name: "Local Server",
        type: "local",
        path: "/var/backups/mongodb",
        isDefault: true,
        enabled: true,
        usedSpace: "45.2 GB",
        totalSpace: "100 GB",
        usagePercent: 45.2,
      },
      {
        id: "storage_2",
        name: "AWS S3",
        type: "s3",
        path: "s3://bizconnect-backups/production",
        isDefault: false,
        enabled: true,
        usedSpace: "128.5 GB",
        totalSpace: "500 GB",
        usagePercent: 25.7,
      },
      {
        id: "storage_3",
        name: "Google Cloud Storage",
        type: "gcs",
        path: "gs://bizconnect-backups",
        isDefault: false,
        enabled: false,
        usedSpace: "0 GB",
        totalSpace: "200 GB",
        usagePercent: 0,
      },
      {
        id: "storage_4",
        name: "Azure Blob Storage",
        type: "azure",
        path: "azure://bizconnect-container/backups",
        isDefault: false,
        enabled: false,
        usedSpace: "0 GB",
        totalSpace: "200 GB",
        usagePercent: 0,
      },
    ]

    return NextResponse.json({
      backups,
      schedules,
      storageLocations,
      stats: {
        totalDocuments: userCount + eventCount + paymentCount,
        collections: 10,
      },
    })
  } catch (error) {
    console.error("Error fetching backup data:", error)
    return NextResponse.json({ error: "Failed to fetch backup data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In production, this would trigger an actual backup job
    const newBackup = {
      id: `backup_${Date.now()}`,
      name: body.name,
      type: body.type,
      status: "in_progress",
      size: "0 MB",
      sizeBytes: 0,
      createdAt: new Date().toISOString(),
      storage: body.storage,
      encryption: body.encryption,
      collections: body.collections || [],
      retentionDays: 30,
    }

    return NextResponse.json(newBackup, { status: 201 })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
