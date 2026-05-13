import type {
  AmazonDeliveryOrder,
  AmazonDeliveryRisk,
  AmazonInventorySnapshot,
  AmazonRouteDecision,
} from './types';

function hasCompleteAddress(order: AmazonDeliveryOrder): boolean {
  const address = order.destination;
  return Boolean(
    address?.addressLine1 &&
    address.city &&
    address.postalCode &&
    address.countryCode,
  );
}

function hasPackageData(order: AmazonDeliveryOrder): boolean {
  return Boolean(order.packages?.length && order.packages.every((parcel) => (
    parcel.clientReferenceId &&
    parcel.weight?.value > 0 &&
    parcel.dimensions?.length > 0 &&
    parcel.dimensions.width > 0 &&
    parcel.dimensions.height > 0
  )));
}

function amazonCanFulfill(order: AmazonDeliveryOrder, inventory: AmazonInventorySnapshot): boolean {
  return order.items.every((item) => {
    const available = inventory[item.sku]?.fulfillableQuantity ?? 0;
    return item.quantity > 0 && available >= item.quantity;
  });
}

export function createAmazonRouteDecision(
  order: AmazonDeliveryOrder,
  inventory: AmazonInventorySnapshot,
  amazonCredentialsReady: boolean,
): AmazonRouteDecision {
  const risks: AmazonDeliveryRisk[] = [];
  const requiredSkus = order.items.map((item) => item.sku);
  const addressReady = hasCompleteAddress(order);
  const packageReady = hasPackageData(order);
  const mcfAllowed = order.allowAmazonMcf !== false;
  const shippingAllowed = order.allowAmazonShipping !== false;
  const inventoryReady = amazonCanFulfill(order, inventory);

  if (!addressReady) risks.push('missing_address');
  if (!inventoryReady) risks.push('missing_inventory');
  if (!packageReady) risks.push('missing_package');
  if (!amazonCredentialsReady) risks.push('amazon_credentials_missing');

  if (mcfAllowed && addressReady && inventoryReady) {
    return {
      route: 'AMAZON_MCF',
      reason: 'Amazon FBA inventory can fulfill every SKU and the destination address is complete.',
      fallback: shippingAllowed && packageReady ? 'AMAZON_SHIPPING' : 'LOCAL_CARRIER',
      risks: risks.length ? risks : ['none'],
      requiredSkus,
      createdAt: new Date().toISOString(),
    };
  }

  if (shippingAllowed && addressReady && packageReady) {
    return {
      route: 'AMAZON_SHIPPING',
      reason: 'MCF is unavailable, but shipment package and address data are ready for Amazon Shipping rate/label flow.',
      fallback: 'LOCAL_CARRIER',
      risks: risks.length ? risks : ['none'],
      requiredSkus,
      createdAt: new Date().toISOString(),
    };
  }

  if (!addressReady || (!inventoryReady && !packageReady)) {
    risks.push('manual_review_required');
    return {
      route: 'MANUAL_REVIEW',
      reason: 'The order is missing data required for automated Amazon MCF or Amazon Shipping execution.',
      fallback: 'LOCAL_CARRIER',
      risks: Array.from(new Set(risks)),
      requiredSkus,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    route: 'LOCAL_CARRIER',
    reason: 'Amazon is not the best execution path for this order; route to the existing local carrier adapter.',
    fallback: 'MANUAL_REVIEW',
    risks: risks.length ? risks : ['none'],
    requiredSkus,
    createdAt: new Date().toISOString(),
  };
}
