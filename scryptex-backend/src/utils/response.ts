
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ResponseHelper {
  static success<T>(data: T, meta?: Partial<APIResponse['meta']>): APIResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: '',
        ...meta,
      },
    };
  }

  static error(
    code: string,
    message: string,
    details?: any,
    meta?: Partial<APIResponse['meta']>
  ): APIResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: '',
        ...meta,
      },
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    meta?: Partial<APIResponse['meta']>
  ): APIResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: '',
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        ...meta,
      },
    };
  }
}
