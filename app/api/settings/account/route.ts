import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Deactivate account
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'deactivate') {
      // Soft delete - set isActive to false
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Account deactivated successfully'
      });
    }

    if (action === 'reactivate') {
      // Reactivate account
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Account reactivated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing account:', error);
    return NextResponse.json(
      { error: 'Failed to manage account' },
      { status: 500 }
    );
  }
}