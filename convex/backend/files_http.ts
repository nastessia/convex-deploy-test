import { httpAction } from "../_generated/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * HTTP endpoint for file uploads
 * Supports:
 * - Image uploads (jpg, jpeg, png, gif, webp)
 * - Size limit of 10MB
 * - Returns a storageId that can be used to access the file
 */
export const uploadFile = httpAction(async (ctx, request) => {
  try {
    const contentType = request.headers.get("Content-Type");
    if (!contentType) {
      return new Response(JSON.stringify({ 
        error: "Content-Type header is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp"
    ];
    
    if (!allowedTypes.includes(contentType)) {
      return new Response(JSON.stringify({ 
        error: "Invalid file type. Only images (jpg, jpeg, png, gif, webp) are allowed." 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const contentLength = parseInt(request.headers.get("Content-Length") || "0");
    if (contentLength > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }), {
        status: 413,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const file = await request.blob();
    const storageId = await ctx.storage.store(file);

    return new Response(JSON.stringify({ 
      storageId,
      success: true
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("File upload error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});

/**
 * HTTP endpoint to get file URL by storage ID
 */
export const getFileUrl = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const storageId = url.searchParams.get('storageId');

    if (!storageId) {
      return new Response(JSON.stringify({ 
        error: "storageId parameter is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Get the file directly
    const file = await ctx.storage.get(storageId);
    
    if (!file) {
      return new Response(JSON.stringify({ 
        error: "File not found" 
      }), {
        status: 404,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    let contentType = "image/jpeg";
    if (file.type) {
      contentType = file.type;
    }

    return new Response(file, {
      status: 200,
      headers: { 
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    console.error("Get file error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});

/**
 * HTTP endpoint to delete file by storage ID
 */
export const deleteFile = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const storageId = url.searchParams.get('storageId');

    if (!storageId) {
      return new Response(JSON.stringify({ 
        error: "storageId parameter is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Delete file from storage
    await ctx.storage.delete(storageId);

    return new Response(JSON.stringify({ 
      success: true,
      message: "File deleted successfully"
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Delete file error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});

