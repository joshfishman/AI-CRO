import { NextResponse } from 'next/server';

export async function GET() {
  const bookmarkletCode = `javascript:(function(){
    var s = document.createElement('script');
    s.src = '${process.env.VERCEL_URL || 'http://localhost:3000'}/api/selector-bookmarklet';
    document.body.appendChild(s);
  })();`;

  return NextResponse.json({ code: bookmarkletCode });
} 