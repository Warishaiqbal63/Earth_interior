"use client";

import { removeSampleProductsAction } from "@/app/admin/actions/products";
import { ConfirmButton } from "./ConfirmButton";
import { runAction } from "./run-action";

export function RemoveSamplesButton({ count }: { count: number }) {
  return (
    <ConfirmButton
      className="btn btn-sm btn-outline"
      title={`Remove ${count} sample product${count === 1 ? "" : "s"}?`}
      body="The example products that came with the website will be deleted. Products you added or edited yourself are kept."
      confirmText="Remove samples"
      onConfirm={() => runAction(removeSampleProductsAction, "Sample products removed.")}
    >
      Remove sample products
    </ConfirmButton>
  );
}
