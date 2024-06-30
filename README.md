# Disk Auto Mount Generator for Systemd

## Commands

### Get UUID for Disk

1. Run the command `lsblk -f`
2. Look for the disk you want to mount
3. Copy the UUID

### Gen the mount file

```bash
[Unit]
Description=Disk Auto Mount Service

[Mount]
What=/dev/disk/by-uuid/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Where=/data/disk
Type=ext4
Options=defaults,rw,noatime

[Install]
WantedBy=multi-user.target
```

###
