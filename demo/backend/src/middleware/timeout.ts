/**
 * Request Timeout Middleware
 * Ensures API requests don't hang indefinitely
 * Target: <200ms response time
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Request timeout middleware
 * Aborts requests that take longer than specified timeout
 * 
 * @param timeoutMs - Timeout in milliseconds (default: 30000ms = 30s)
 */
export function requestTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        const elapsed = Date.now() - startTime;
        console.error(`[Timeout] Request timeout after ${elapsed}ms: ${req.method} ${req.path}`);
        
        res.status(408).json({
          success: false,
          message: 'Request timeout - operation took too long',
          data: null,
        });
      }
    }, timeoutMs);
    
    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      
      // Log slow requests (>500ms)
      if (elapsed > 500) {
        console.warn(`[Performance] Slow request (${elapsed}ms): ${req.method} ${req.path}`);
      } else {
        console.log(`[Performance] Request completed in ${elapsed}ms: ${req.method} ${req.path}`);
      }
    });
    
    next();
  };
}

/**
 * Performance monitoring middleware
 * Tracks request duration and logs performance metrics
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Override res.json to capture response size
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const elapsed = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
    
    // Calculate response size
    const responseSize = JSON.stringify(data).length;
    
    // Log performance metrics
    console.log('[Performance]', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${elapsed}ms`,
      responseSize: `${(responseSize / 1024).toFixed(2)}KB`,
      memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      timestamp: new Date().toISOString(),
    });
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${elapsed}ms`);
    res.setHeader('X-Response-Size', `${responseSize}`);
    
    return originalJson(data);
  };
  
  next();
}
