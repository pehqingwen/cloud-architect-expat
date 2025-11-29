http://a82930ec009464c38b192c011d45e901-1704323071.us-east-1.elb.amazonaws.com/

Architecture: 
- Client (Vite React) -> EKS frontend service (LoadBalancer)
- API (Node/Express) -> EKS backend service (LoadBalancer)
- Backend:
    - MongoDB Atlas
    - S3 (avatars) via presigned POST
- CI/CD: GitHub Actions -> build Docker images -> push to ECR -> kubectl apply/rollout to EKS

Pipeline flow: 
1. git push main
2. GitHub Actions:
     - logs in AWS
     - builds & pushes backend:latest and frontend:latest to ECR
     - updates EKS via kubectl apply + rollout restart
3. New pods spin up and serve traffic. 
