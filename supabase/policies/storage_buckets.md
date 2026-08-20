Storage buckets guidance (not SQL):

- Create a private bucket for verification documents, e.g. `verification-docs`.
- Configure the bucket to be private (no public object access).
- Generate signed URLs from the backend for safe short-lived access when needed.
- Use Supabase Storage policies or service role to restrict management operations to admins.

Example CLI (Supabase):

```bash
# create private bucket
supabase storage bucket create verification-docs --public false
```
