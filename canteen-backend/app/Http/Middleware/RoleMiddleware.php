<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->hasRole($roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role.',
                'required_roles' => $roles,
                'your_role' => $request->user()->role,
            ], 403);
        }

        return $next($request);
    }
}
