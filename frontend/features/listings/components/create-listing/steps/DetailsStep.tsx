import { CreateListingFormField } from "@/features/listings/components/create-listing/FormField";
import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";
import type { DeliveryMethod, ListingType, ToolCondition } from "@/features/listings/types";
import { inputCls, inputErrCls } from "@/lib/utils";

export interface CreateListingDetailsStepProps {
  type: ListingType;
  title: string;
  description: string;
  tagsRaw: string;
  skillName: string;
  estimatedHours: string;
  deliveryMethod: DeliveryMethod;
  exchangeFor: string;
  condition: ToolCondition;
  maxBorrowDays: string;
  depositAmount: string;
  toolCategory: string;
  errors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsRawChange: (value: string) => void;
  onSkillNameChange: (value: string) => void;
  onEstimatedHoursChange: (value: string) => void;
  onDeliveryMethodChange: (value: DeliveryMethod) => void;
  onExchangeForChange: (value: string) => void;
  onConditionChange: (value: ToolCondition) => void;
  onMaxBorrowDaysChange: (value: string) => void;
  onDepositAmountChange: (value: string) => void;
  onToolCategoryChange: (value: string) => void;
}

export function CreateListingDetailsStep({
  type,
  title,
  description,
  tagsRaw,
  skillName,
  estimatedHours,
  deliveryMethod,
  exchangeFor,
  condition,
  maxBorrowDays,
  depositAmount,
  toolCategory,
  errors,
  onTitleChange,
  onDescriptionChange,
  onTagsRawChange,
  onSkillNameChange,
  onEstimatedHoursChange,
  onDeliveryMethodChange,
  onExchangeForChange,
  onConditionChange,
  onMaxBorrowDaysChange,
  onDepositAmountChange,
  onToolCategoryChange,
}: CreateListingDetailsStepProps) {
  const isToolListing = type === "TOOL_LISTING";

  return (
    <CreateListingStepPanel
      title="Describe it"
      sub="A clear title and an honest description get 3× more requests."
    >
      <div className="space-y-4">
        <CreateListingFormField label="Title" hint="120 chars max">
          <input
            className={errors.title ? inputErrCls : inputCls}
            placeholder={
              isToolListing
                ? "e.g. DEWALT cordless drill — happy to lend"
                : "e.g. Conversational Spanish — beginner to B1"
            }
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={120}
          />
          {errors.title && (
            <span className="mt-1 block text-[11px] text-rose-600">{errors.title}</span>
          )}
        </CreateListingFormField>

        <CreateListingFormField label="Description" hint="2000 chars max">
          <textarea
            rows={6}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Tell neighbours what you're offering…"
            className="w-full resize-y rounded-lg border border-line2 bg-surface p-3 text-sm text-ink placeholder-ink3 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            maxLength={2000}
          />
          <span className="mt-1 block text-[10px] text-ink3">{description.length}/2000</span>
          {errors.description && (
            <span className="mt-1 block text-[11px] text-rose-600">{errors.description}</span>
          )}
        </CreateListingFormField>

        <div className="grid grid-cols-2 gap-4">
          {isToolListing ? (
            <>
              <CreateListingFormField label="Condition">
                <select
                  className={inputCls}
                  value={condition}
                  onChange={(event) => onConditionChange(event.target.value as ToolCondition)}
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like new</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </CreateListingFormField>
              <CreateListingFormField label="Max borrow days" hint="optional">
                <input
                  type="number"
                  min="1"
                  className={errors.maxBorrowDays ? inputErrCls : inputCls}
                  placeholder="7"
                  value={maxBorrowDays}
                  onChange={(event) => onMaxBorrowDaysChange(event.target.value)}
                />
                {errors.maxBorrowDays && (
                  <span className="mt-1 block text-[11px] text-rose-600">
                    {errors.maxBorrowDays}
                  </span>
                )}
              </CreateListingFormField>
              <CreateListingFormField label="Deposit (€)" hint="optional, refundable">
                <input
                  type="number"
                  min="0"
                  className={errors.depositAmount ? inputErrCls : inputCls}
                  placeholder="50"
                  value={depositAmount}
                  onChange={(event) => onDepositAmountChange(event.target.value)}
                />
                {errors.depositAmount && (
                  <span className="mt-1 block text-[11px] text-rose-600">
                    {errors.depositAmount}
                  </span>
                )}
              </CreateListingFormField>
              <CreateListingFormField label="Category">
                <input
                  className={errors.category ? inputErrCls : inputCls}
                  placeholder="e.g. Power tools, Garden"
                  value={toolCategory}
                  onChange={(event) => onToolCategoryChange(event.target.value)}
                  maxLength={100}
                />
                {errors.category && (
                  <span className="mt-1 block text-[11px] text-rose-600">{errors.category}</span>
                )}
              </CreateListingFormField>
            </>
          ) : (
            <>
              <CreateListingFormField label="Skill name">
                <input
                  className={errors.skillName ? inputErrCls : inputCls}
                  placeholder="e.g. Guitar, React, Plumbing"
                  value={skillName}
                  onChange={(event) => onSkillNameChange(event.target.value)}
                  maxLength={100}
                />
                {errors.skillName && (
                  <span className="mt-1 block text-[11px] text-rose-600">{errors.skillName}</span>
                )}
              </CreateListingFormField>
              <CreateListingFormField label="Session length (h)" hint="optional">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className={errors.estimatedHours ? inputErrCls : inputCls}
                  placeholder="2"
                  value={estimatedHours}
                  onChange={(event) => onEstimatedHoursChange(event.target.value)}
                />
                {errors.estimatedHours && (
                  <span className="mt-1 block text-[11px] text-rose-600">
                    {errors.estimatedHours}
                  </span>
                )}
              </CreateListingFormField>
              <CreateListingFormField label="Delivery">
                <select
                  className={inputCls}
                  value={deliveryMethod}
                  onChange={(event) => onDeliveryMethodChange(event.target.value as DeliveryMethod)}
                >
                  <option value="IN_PERSON">In person</option>
                  <option value="REMOTE">Remote</option>
                  <option value="BOTH">Both</option>
                </select>
              </CreateListingFormField>
              <CreateListingFormField label="Exchange for" hint="optional">
                <input
                  className={inputCls}
                  placeholder="e.g. cooking lessons, gardening…"
                  value={exchangeFor}
                  onChange={(event) => onExchangeForChange(event.target.value)}
                  maxLength={300}
                />
              </CreateListingFormField>
            </>
          )}
        </div>

        <CreateListingFormField label="Tags" hint="comma-separated, optional">
          <input
            className={inputCls}
            placeholder="e.g. beginner-friendly, Braga, weekends"
            value={tagsRaw}
            onChange={(event) => onTagsRawChange(event.target.value)}
          />
          <span className="mt-1 block text-[10px] text-ink3">Up to 10 tags, 40 chars each</span>
        </CreateListingFormField>
      </div>
    </CreateListingStepPanel>
  );
}
