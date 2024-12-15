import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$connect();
    
    // テストユーザーの作成を試みる
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });

    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      user 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}