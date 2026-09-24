import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function apiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ZodError) {
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

      console.error('API Error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}
