---
description: Build and deploy the project to GCP (Docker Image + VM Update)
---

# GCP Deployment Workflow

Follow this procedure to deploy changes to the GCP environment.

1. **Commit Changes**
   Running `build-push.sh` uses the current git commit for versioning. Ensure all changes are committed.
   ```bash
   git add .
   git commit -m "Fix: Your commit message here"
   git push origin master
   ```

2. **Build and Push Docker Image**
   Run the local script to build the multi-arch image and push it to GCP Artifact Registry.
   // turbo
   ```bash
   ./build-push.sh
   ```

3. **Deploy to VM**
   You need to SSH into the VM and pull the new image.
   ```bash
   # SSH into VM (Manual Step)
   ssh user@your-vm-ip
   
   # Run update script
   ./update-site.sh
   ```

4. **Verify Deployment**
   Check the site health and logs if necessary.
   ```bash
   # On VM
   docker logs b9-backend
   ```
