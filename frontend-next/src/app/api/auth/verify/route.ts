import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin password not configured' 
      }, { status: 500 });
    }

    // Check if password matches
    if (password === adminPassword) {
      return NextResponse.json({ 
        success: true 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid password' 
      }, { status: 401 });
    }

  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 