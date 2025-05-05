import { NextResponse } from "next/server";

// Mock file upload implementation
async function mockUploadFile(fileName: string, buffer: Buffer): Promise<string> {
  // In a real implementation, this would upload to S3 or another storage service
  console.log(`Mock file upload: ${fileName}, size: ${buffer.length} bytes`);
  
  // Generate a mock URL - in production, this would be the actual file URL
  const mockUrl = `/uploads/${fileName}`;
  return mockUrl;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use mock upload function instead of real S3 upload
    const url = await mockUploadFile(file.name, buffer);
    
    return NextResponse.json({ 
      url,
      success: true,
      message: "File uploaded successfully (mock implementation)"
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
