# Supabase Leaked Password Protection Checklist

## Purpose

Enable Supabase Auth leaked password protection and record the verification steps for release readiness.

This setting is controlled in the Supabase dashboard, not repository code.

## Best free/legal gateway

Use the Supabase dashboard for the active production project.

## Exact next steps

1. Open the active Supabase project for Infamous Freight.
2. Go to `Authentication -> Providers` or the current Auth security settings area.
3. Enable leaked password protection.
4. Save the setting.
5. Re-run the Supabase security advisor.
6. Record whether the advisor warning cleared.

## Verification

Confirm all of the following:

- New weak/known-compromised passwords are rejected by Supabase Auth.
- Normal signup/login still works with a strong test password.
- Password reset still works.
- Supabase security advisor no longer reports leaked password protection as disabled, or the exception is documented.

## Automation or repeatable loop

Add this to weekly security review:

1. Open Supabase security advisor.
2. Confirm leaked password protection remains enabled.
3. Confirm no new Auth warnings are present.
4. Record review date in the launch evidence log or security review notes.

## Risk check

This can block users who attempt to use known-compromised passwords. That is desired for production security. If support tickets increase, improve password guidance instead of disabling the protection.

## Fallback option

If enabling the setting causes onboarding issues, keep it enabled and update signup/reset copy to explain strong password requirements.

## Related

Supports #2225.
