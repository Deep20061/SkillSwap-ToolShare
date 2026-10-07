"use client";

import { useMemo } from "react";
import { AppFooter } from "@/components/AppFooter";
import { ArrowL } from "@/components/ui/Icons";
import { CreateListingStepFooter } from "@/features/listings/components/create-listing/CreateListingStepFooter";
import { CreateListingStepRail } from "@/features/listings/components/create-listing/CreateListingStepRail";
import { CreateListingCategoryStep } from "@/features/listings/components/create-listing/steps/CategoryStep";
import { CreateListingDetailsStep } from "@/features/listings/components/create-listing/steps/DetailsStep";
import { CreateListingLocationStep } from "@/features/listings/components/create-listing/steps/LocationStep";
import { CreateListingPhotosStep } from "@/features/listings/components/create-listing/steps/PhotosStep";
import { CreateListingPreviewStep } from "@/features/listings/components/create-listing/steps/PreviewStep";
import { CreateListingTypeStep } from "@/features/listings/components/create-listing/steps/TypeStep";
import { useCategories } from "@/features/listings/hooks/useCategories";
import { useCreateListing } from "@/features/listings/hooks/useCreateListing";
import { useCreateListingWizard } from "@/features/listings/hooks/useCreateListingWizard";
import { useLocationAutocomplete } from "@/features/listings/hooks/useLocationAutocomplete";
import { useLocationStep } from "@/features/listings/hooks/useLocationStep";

export default function NewListingPage() {
  const {
    sessionLoading,
    isAuthenticated,
    type,
    setType,
    title,
    setTitle,
    description,
    setDescription,
    tagsRaw,
    setTagsRaw,
    skillName,
    setSkillName,
    estimatedHours,
    setEstimatedHours,
    deliveryMethod,
    setDeliveryMethod,
    exchangeFor,
    setExchangeFor,
    category,
    setCategory,
    condition,
    setCondition,
    depositAmount,
    setDepositAmount,
    maxBorrowDays,
    setMaxBorrowDays,
    photos,
    photoPreviews,
    photoInputRef,
    errors,
    isSubmitting,
    submitError,
    handlePhotoSelect,
    removePhoto,
    handleSubmit,
    locationName,
    setLocationName,
    setLatitude,
    setLongitude,
    listingCategoryId,
    setListingCategoryId,
  } = useCreateListing();

  const { categories, loading: categoriesLoading } = useCategories();

  const { geo, previewLat, previewLng, reverseLoading, handleLocationResult } = useLocationStep({
    setLatitude,
    setLongitude,
    setLocationName,
    locationName,
  });

  const wizardValidation = useMemo(
    () => ({
      listingCategoryId,
      title,
      description,
      type,
      skillName,
      toolCategory: category,
      photoCount: photos.length,
    }),
    [listingCategoryId, title, description, type, skillName, category, photos.length]
  );

  const { currentStep, stepError, goToPreviousStep, goToStep, continueToNextStep } =
    useCreateListingWizard(wizardValidation);

  const {
    locationQuery,
    showSuggestions,
    setShowSuggestions,
    locationResults,
    wrapperRef,
    updateLocationQuery,
  } = useLocationAutocomplete(locationName, setLocationName);

  function handleHeaderBack() {
    if (currentStep > 0) {
      goToPreviousStep();
    } else {
      history.back();
    }
  }

  function handleCategoryToggle(categoryId: string) {
    setListingCategoryId(listingCategoryId === categoryId ? undefined : categoryId);
  }

  function handleAddPhotoClick() {
    if (photos.length < 8) {
      photoInputRef.current?.click();
    }
  }

  function handleSelectLocation(lat: number, lng: number, displayName: string) {
    updateLocationQuery(displayName);
    handleLocationResult(lat, lng, displayName);
    setShowSuggestions(false);
  }

  const selectedCategoryName =
    categories.find((entry) => entry.id === listingCategoryId)?.name ?? "—";

  if (sessionLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-full items-center justify-center bg-surface">
        <div className="animate-pulse font-mono text-sm text-ink3">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="flex items-center gap-1.5 text-sm text-ink2 hover:text-ink"
          >
            <ArrowL size={14} /> {currentStep > 0 ? "Back" : "Back to marketplace"}
          </button>
          <button type="button" className="text-sm text-ink3 hover:text-ink">
            Save as draft
          </button>
        </div>

        <CreateListingStepRail currentStep={currentStep} onStepClick={goToStep} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="min-h-[420px] rounded-2xl border border-line bg-surface p-6 md:p-8">
            {currentStep === 0 && <CreateListingTypeStep type={type} onTypeChange={setType} />}

            {currentStep === 1 && (
              <CreateListingCategoryStep
                categories={categories}
                categoriesLoading={categoriesLoading}
                listingCategoryId={listingCategoryId}
                onCategoryToggle={handleCategoryToggle}
                categoryError={errors.listingCategoryId}
              />
            )}

            {currentStep === 2 && (
              <CreateListingDetailsStep
                type={type}
                title={title}
                description={description}
                tagsRaw={tagsRaw}
                skillName={skillName}
                estimatedHours={estimatedHours}
                deliveryMethod={deliveryMethod}
                exchangeFor={exchangeFor}
                condition={condition}
                maxBorrowDays={maxBorrowDays}
                depositAmount={depositAmount}
                toolCategory={category}
                errors={errors}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onTagsRawChange={setTagsRaw}
                onSkillNameChange={setSkillName}
                onEstimatedHoursChange={setEstimatedHours}
                onDeliveryMethodChange={setDeliveryMethod}
                onExchangeForChange={setExchangeFor}
                onConditionChange={setCondition}
                onMaxBorrowDaysChange={setMaxBorrowDays}
                onDepositAmountChange={setDepositAmount}
                onToolCategoryChange={setCategory}
              />
            )}

            {currentStep === 3 && (
              <CreateListingPhotosStep
                photoPreviews={photoPreviews}
                photoInputRef={photoInputRef}
                onPhotoSelect={handlePhotoSelect}
                onRemovePhoto={removePhoto}
                onAddPhotoClick={handleAddPhotoClick}
              />
            )}

            {currentStep === 4 && (
              <CreateListingLocationStep
                locationQuery={locationQuery}
                showSuggestions={showSuggestions}
                locationResults={locationResults}
                wrapperRef={wrapperRef}
                reverseLoading={reverseLoading}
                previewLat={previewLat}
                previewLng={previewLng}
                geo={geo}
                onLocationQueryChange={updateLocationQuery}
                onLocationQueryFocus={() =>
                  locationQuery.trim().length >= 2 && setShowSuggestions(true)
                }
                onDismissSuggestions={() => setShowSuggestions(false)}
                onSelectLocation={handleSelectLocation}
              />
            )}

            {currentStep === 5 && (
              <CreateListingPreviewStep
                type={type}
                categoryName={selectedCategoryName}
                title={title}
                photoCount={photos.length}
                locationName={locationName}
                submitError={submitError}
                isSubmitting={isSubmitting}
              />
            )}

            <CreateListingStepFooter
              currentStep={currentStep}
              stepError={stepError}
              onBack={goToPreviousStep}
              onContinue={continueToNextStep}
            />
          </div>
        </form>
      </div>

      <AppFooter />
    </div>
  );
}
