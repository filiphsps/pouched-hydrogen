import type { CustomerDetailsFragment } from "customer-account-api.generated";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/link";

export function AccountDetails({
    customer,
}: {
    customer: CustomerDetailsFragment;
}) {
    const { firstName, lastName, emailAddress, phoneNumber } = customer;
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="font-bold">{t("account.title")}</div>
            <div className="space-y-4 border border-line-subtle p-5">
                <div className="space-y-1">
                    <div className="text-body-subtle">
                        {t("account.firstName")} / {t("account.lastName")}
                    </div>
                    <div>{fullName || t("account.na")}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-body-subtle">{t("account.phone")}</div>
                    <div>{phoneNumber?.phoneNumber ?? t("account.na")}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-body-subtle">{t("account.email")}</div>
                    <div>{emailAddress?.emailAddress ?? t("account.na")}</div>
                </div>

                <div>
                    <Link
                        prefetch="intent"
                        variant="underline"
                        className="text-body-subtle after:bg-body-subtle"
                        to="/account/edit"
                    >
                        {t("account.editDetails")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
