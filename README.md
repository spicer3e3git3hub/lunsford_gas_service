# Lunsford Gas Service — Website

Plain HTML/CSS/JS site, no build step, no framework. Every page is a real .html file you can open directly in a browser to preview.

## What's here

```
index.html            Home
services.html          Services
gallery.html            Past work (real photos in assets/gallery)
faq.html                  FAQ
about.html               Company story (draft copy, edit freely)
schedule.html          Appointment request form
contact.html            Contact info
css/styles.css         All styling
js/main.js               Mobile nav and form logic
assets/mark.svg       Placeholder logo mark, replace once a real logo exists
assets/favicon.svg   Placeholder favicon
functions/api/schedule-request.js   Cloudflare Pages Function that emails the office on form submit
```

## 1. Push this to GitHub

If you don't already have a repo for this:

```
cd lunsford-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lunsford-gas-service.git
git push -u origin main
```

## 2. Deploy on Cloudflare Pages (free)

1. Go to the Cloudflare dashboard, then Workers and Pages, then Create, then Pages, then Connect to Git.
2. Pick this GitHub repo.
3. Build settings: no build command needed, no framework preset, just set the output directory to / (the repo root).
4. Deploy. You'll get a free *.pages.dev URL immediately, live and working.

Every future git push to main auto deploys. No manual redeploy step.

## 3. Connect the real domain

- If you move the domain to Cloudflare Registrar, it attaches to the Pages project with a couple of clicks under the project's Custom domains tab.
- If you keep the domain elsewhere for now, add it as a custom domain in the same tab and update the DNS records at your current registrar to point to Cloudflare Pages.

## 4. Turn on the appointment form's email notifications

The form itself works right now. It validates input and shows a message either way. To actually get emailed when someone submits it:

1. Create a free account at resend.com (3,000 emails a month free, plenty for this).
2. Verify your domain in Resend (Domains, then Add, then add the DNS records it gives you).
3. Generate an API key in Resend.
4. In the Cloudflare Pages project, under Settings, Environment variables, add:
   - RESEND_API_KEY, the key from step 3
   - NOTIFY_EMAIL, the email address that should receive appointment requests
   - FROM_EMAIL, a sender address on your verified domain

5. Redeploy, or just push any small change since it redeploys automatically.

Until those environment variables are set, the form will show the fallback message telling the customer to call directly instead of silently failing.

## 5. Swap in real content

Search for these and replace before launch:
- assets/mark.svg and assets/favicon.svg, replace once the real logo exists (same filenames, nothing else needs to change)
- Gallery photos in gallery.html
- Business hours and address in contact.html
- Story details in about.html
- FAQ content in faq.html (all drafted, meant to be edited)

## Notes on how it's built

- No JavaScript framework. Plain HTML/CSS/JS keeps this easy to maintain without a build pipeline, and works with zero configuration on Cloudflare Pages.
- Page to page transitions use the CSS view transition rule in styles.css. Modern browsers get a smooth cross fade between pages automatically, and older browsers just navigate normally. No JS required.
- The FAQ accordion uses native details and summary tags, no JavaScript, fully keyboard accessible by default.
- The possible gas leak option in the appointment form triggers a safety warning inline. This is intentional and should not be removed.
- Services follow the owner bio: gas log installation and service, gas fire pits (warmer months), and outdoor kitchen equipment installation. Page wording was written to match that bio.

## Adding photos to the gallery

1. Drop the photo file into assets/photos/
2. Open js/photos.js and add the file name to the list (keep the commas)

That is all. The slideshow shows photos exactly as they are, nothing is cropped.
