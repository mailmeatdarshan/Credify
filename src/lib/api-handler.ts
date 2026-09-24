import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function apiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[apiHandler] Zod validation error:', JSON.stringify(error.errors));
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      // Log the full error details for debugging
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      console.error('[apiHandler] Unhandled API error:', message);
      if (stack) console.error('[apiHandler] Stack:', stack);

      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}

