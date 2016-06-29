# abe-test-os

test website for [abejs](https://github.com/AdFabConnect/abejs)

```shell
git clone https://github.com/nicolaslabbe/abe-test-os.git

cd abe-test-os

npm i
```

install plugin if needed

```shell
cd abe-test-os/plugins

# cd [ some plugin ]
cd users

npm i
```

## serve

```shell
cd abe-test-os

abe serve
```

open [localhost](http://localhost:8000/)

> open with https if cert.pem and key.pem are present (or http to remove them)
> users plugin need https

### Users plugin

Keep users plugin or remove it

If you choose to keep it
Login : admin
Mpd : Ad1m@test