"use client";

import { Suspense } from "react";
import { AppFooter } from "@/components/AppFooter";
import { BrowseGridResults } from "@/features/listings/components/browse/BrowseGridResults";
import { BrowseGridSidebar } from "@/features/listings/components/browse/BrowseGridSidebar";
import { BrowsePageHeader } from "@/features/listings/components/browse/BrowsePageHeader";
import { MapBrowseView } from "@/features/listings/components/map/MapBrowseView";
import { useCategories } from "@/features/listings/hooks/useCategories";
import { useGeolocation } from "@/features/listings/hooks/useGeolocation";
import { useListings } from "@/features/listings/hooks/useListings";
import { useMapPins } from "@/features/listings/hooks/useMapPins";
import { useNearCity } from "@/features/listings/hooks/useNearCity";
import { useViewMode } from "@/features/listings/hooks/useViewMode";
import { getBrowseKindLabel } from "@/features/listings/lib/getBrowseKindLabel";

function BrowseInner() {
  const { mode, setMode } = useViewMode();
  const geo = useGeolocation();
  const { categories } = useCategories();
  const geoAvailable = geo.supported && geo.lat !== null;
  const nearCity = useNearCity(geo.lat, geo.lng);

  const {
    listings,
    pagination,
    isLoading,
    error,
    selectedType,
    query,
    setQuery,
    selectedTag,
    page,
    setPage,
    hasFilters,
    handleTypeChange,
    handleSearch,
    clearAll,
    categoryId,
    verifiedOnly,
    setVerifiedOnly,
    minDeposit,
    setMinDeposit,
    maxDeposit,
    setMaxDeposit,
    distanceKm,
    setDistanceKm,
    superHostOnly,
    setSuperHostOnly,
  } = useListings({ userLat: geo.lat, userLng: geo.lng });

  const { pins, setBbox } = useMapPins({
    selectedType,
    query,
    selectedTag,
    categoryId,
    verifiedOnly,
    superHostOnly,
    distanceKm,
    userLat: geo.lat,
    userLng: geo.lng,
  });

  const kindLabel = getBrowseKindLabel(selectedType);
  const catLabel = categories.find((category) => category.id === categoryId)?.name;
  const mapCenter: [number, number] | undefined =
    geo.lat != null && geo.lng != null ? [geo.lat, geo.lng] : undefined;

  const headerProps = {
    kindLabel,
    catLabel,
    totalResults: pagination.total,
    nearCity,
    isLoading,
    mode: mode as "grid" | "map",
    onGrid: () => setMode("grid"),
    onMap: () => setMode("map"),
    geoAvailable,
  };

  if (mode === "map") {
    return (
      <div className="min-h-full bg-surface">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <BrowsePageHeader {...headerProps} />
          <MapBrowseView
            listings={listings}
            pins={pins}
            isLoading={isLoading}
            pagination={pagination}
            nearCity={nearCity}
            geoAvailable={geoAvailable}
            mapCenter={mapCenter}
            mapZoom={geo.lat != null ? 12 : 7}
            kindLabel={kindLabel}
            catLabel={catLabel}
            selectedType={selectedType}
            query={query}
            setQuery={setQuery}
            handleTypeChange={handleTypeChange}
            handleSearch={handleSearch}
            distanceKm={distanceKm}
            setDistanceKm={setDistanceKm}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            hasFilters={hasFilters}
            clearAll={clearAll}
            setBbox={setBbox}
            onSwitchToGrid={() => setMode("grid")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <BrowsePageHeader {...headerProps} showSort />
        <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <BrowseGridSidebar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            selectedType={selectedType}
            paginationTotal={pagination.total}
            listings={listings}
            handleTypeChange={handleTypeChange}
            categories={categories}
            categoryId={categoryId}
            distanceKm={distanceKm}
            setDistanceKm={setDistanceKm}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            superHostOnly={superHostOnly}
            setSuperHostOnly={setSuperHostOnly}
            minDeposit={minDeposit}
            setMinDeposit={setMinDeposit}
            maxDeposit={maxDeposit}
            setMaxDeposit={setMaxDeposit}
            hasFilters={hasFilters}
            clearAll={clearAll}
            onSwitchToMap={() => setMode("map")}
          />
          <div className="min-w-0">
            <BrowseGridResults
              listings={listings}
              isLoading={isLoading}
              error={error}
              page={page}
              setPage={setPage}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense>
      <BrowseInner />
    </Suspense>
  );
}
