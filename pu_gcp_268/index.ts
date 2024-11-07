import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const pulumiConfig = new pulumi.Config()
const gcpConfig = new pulumi.Config("gcp")

// // Create a new SQL Database Instance
// const instance = new gcp.sql.DatabaseInstance("my-instance", {
//     name: "my-instance",
//     region: "us-central1",
//     databaseVersion: "MYSQL_8_0",
//     settings: {
//         tier: "db-f1-micro",
//     },
// });

// // Create a new SQL Database
// const database = new gcp.sql.Database("my-database", {
//     name: "my-database",
//     instance: instance.name,
//     charset: "utf8",
//     collation: "utf8_general_ci",
// });

// // Create a new SQL User
// const user = new gcp.sql.User("my-user", {
//     name: "my-user",
//     instance: instance.name,
//     password: "my-password",
// });
// const ubuntu1804LTS = gcp.compute.getImage(
//     {
//         family: "debian-12-bookworm-v20241009",
//         project: "debian-cloud"
//     }
// )

const pulumiConfig = new pulumi.Config()
const networkSelfLink = pulumiConfig.require("network")
const subnetworkSelfLink = pulumiConfig.require("subnetwork")
const hostName = pulumiConfig.require("hostname")

const instance = new gcp.compute.Instance(
    "my-instance",
    {
        name: "my-instance",
        description: "My Instance",
        machineType: "e2-standard-4",
        hostname: hostName,
        bootDisk: {
            autoDelete: true,
            initializeParams: {
                image: "projects/debian-cloud/global/images/debian-11-bullseye-v20240110"
            }
        },
        networkInterfaces: [
            {
                network: networkSelfLink,
                subnetwork: subnetworkSelfLink
            }
        ],
        zone: "us-west1-a",
        allowStoppingForUpdate: false,
        deletionProtection: false,
        canIpForward: true,
        tags: [
            "my-tag"
        ],
        metadata: {
            "enable-oslogin": "TRUE"
        }
    },
    {
        ignoreChanges: [
            "bootDisk"
        ],
    }
)

const group = new gcp.compute.InstanceGroup(
    "my-group",
    {
        name: "my-group",
        namedPorts: [
            {
                name: "https",
                port: 443,
            }
        ],
        network: networkSelfLink,
        zone: "us-west1-a",
        instances: [
            instance.selfLink
        ]
    }
)