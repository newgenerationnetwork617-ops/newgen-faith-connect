<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep personal chats out of every admin read and write path, not only the visible tabs; filter community messages server-side.
- Teaching engagement uses hashed device capabilities for guest ownership and server-validated writes; never expose ownership hashes publicly.
- Share teaching links with a validated teaching query parameter, and reuse the player and engagement controls across Watch and Teachings to keep behavior consistent.
- Render the welcome screen during SSR and gate page content until it finishes to prevent the home page flashing first.
