# React Query Caching Strategy

This document outlines the caching strategy implemented across the application using React Query.

## Global Configuration

**Location**: `components/QueryClientProvider.tsx`

### Default Settings
- **staleTime**: 5 minutes - Data is considered fresh for 5 minutes
- **gcTime**: 30 minutes - Cached data is garbage collected after 30 minutes
- **retry**: 2 attempts - Failed requests are retried twice
- **retryDelay**: Exponential backoff (1s, 2s, 4s... up to 30s max)
- **refetchOnWindowFocus**: true - Refetch when window regains focus
- **refetchOnReconnect**: true - Refetch when network reconnects
- **refetchOnMount**: false - Don't refetch on mount if data is fresh
- **networkMode**: online - Only fetch when online

## Component-Specific Caching

### 1. TrendingTokens Component
**File**: `components/TrendingTokens.tsx`

**Query Key**: `["trending-tokens", chainSlug]`

**Settings**:
- **staleTime**: 5 minutes - Token list changes moderately
- **gcTime**: 30 minutes - Keep cached for half an hour
- **retry**: 3 attempts - Important data, retry more
- **refetchOnWindowFocus**: true - Keep data current
- **refetchOnReconnect**: true - Sync after reconnection

**Rationale**: Trending tokens change periodically but not constantly. Users expect relatively fresh data when switching tabs.

---

### 2. TrendingEthereumToken Component
**File**: `components/TrendingEthereumToken.tsx`

**Query Key**: `["trending-ethereum-tokens"]`

**Settings**:
- **staleTime**: 3 minutes - Trending scores change more frequently
- **gcTime**: 15 minutes - Shorter cache for trending data
- **retry**: 3 attempts - Important trending data
- **refetchOnWindowFocus**: true - Keep trending data current
- **refetchInterval**: 5 minutes - Auto-refresh every 5 minutes

**Rationale**: Trending tokens with scores should be more current as rankings can change quickly. Auto-refresh ensures users see updated rankings.

---

### 3. TrendingTokenCard Component
**File**: `components/TrendingTokenCard.tsx`

**Query Key**: `["token-metadata", tokenAddress, chainSlug]`

**Settings**:
- **staleTime**: 10 minutes - Metadata doesn't change often
- **gcTime**: 60 minutes - Keep cached for 1 hour
- **retry**: 2 attempts - Standard retry
- **refetchOnWindowFocus**: false - No need to refetch metadata
- **refetchOnMount**: false - Reuse cached data
- **refetchOnReconnect**: false - Metadata is relatively static

**Rationale**: Token metadata (name, symbol, decimals) rarely changes. Aggressive caching reduces API calls significantly.

---

### 4. TrendingTokenCardGrid Component
**File**: `components/TrendingTokenCardGrid.tsx`

**Query Key**: `["token-metadata", tokenAddress, chainSlug]`

**Settings**: Same as TrendingTokenCard

**Rationale**: Grid and list views share the same metadata cache, improving efficiency when switching views.

---

## Cache Benefits

### 1. **Reduced API Calls**
- Token metadata is cached for 1 hour across all components
- Trending lists are cached for 5-30 minutes
- Shared cache between list and grid views

### 2. **Improved Performance**
- Instant data display when cache is fresh
- Background refetch keeps data current
- Exponential backoff prevents API overload

### 3. **Better User Experience**
- Fast navigation between pages
- Smooth view switching (list ↔ grid)
- Automatic updates when window regains focus
- Offline-first with stale data

### 4. **Network Efficiency**
- Batched requests with exponential backoff
- Smart refetch only when needed
- Garbage collection prevents memory bloat

## Cache Invalidation

### Manual Invalidation
To manually invalidate cache in components:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific token
queryClient.invalidateQueries({ 
  queryKey: ['token-metadata', tokenAddress] 
});

// Invalidate all trending tokens
queryClient.invalidateQueries({ 
  queryKey: ['trending-tokens'] 
});
```

### Automatic Invalidation
Cache is automatically invalidated:
- After `staleTime` expires
- When window regains focus (if `refetchOnWindowFocus: true`)
- When network reconnects (if `refetchOnReconnect: true`)
- After `gcTime` for garbage collection

## Monitoring Cache

To enable React Query DevTools in development:

```bash
npm install @tanstack/react-query-devtools
```

Add to `QueryClientProvider.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Inside component
<ReactQueryDevtools initialIsOpen={false} />
```

## Best Practices

1. **Use consistent query keys** across components for cache sharing
2. **Set appropriate staleTime** based on data volatility
3. **Use longer gcTime** for stable data
4. **Enable refetchOnWindowFocus** for user-facing data
5. **Disable refetchOnMount** to utilize cache efficiently
6. **Implement exponential backoff** for retry delays
7. **Add chain/network to query keys** for multi-chain support

## Performance Metrics

Expected improvements:
- **50-70% reduction** in API calls for token metadata
- **30-50% reduction** in loading times when navigating
- **90%+ cache hit rate** for frequently accessed tokens
- **Instant loading** for recently viewed tokens
