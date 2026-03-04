@Library('global-pipeline') _

// GlobalPipeline() {
// 	dockerImage = "nephren-ui-revamp:latest"
// 	projectName = "nephren-ui-revamp"
// 	appPort = "7000"
//     networkName = "nephren-ui"
//     buildArgs = [
//         VITE_GOOGLE_TAG: "${this.env.VITE_GOOGLE_TAG}",
//         VITE_NEPHREN_BLOG: "https://blog.nephren.xyz",
//     ]
// }

KubePipeline() {
	dockerImage = "rein-dashboard:latest"
	projectName = "rein-dashboard"
	appPort = "5173"
  externalEndpointsIp = "10.10.10.15"
	kubeNodePort = "30015"
  buildArgs = [
      PUBLIC_API_BASE_URL: "http://222.222.1.104:30025"
  ]
}