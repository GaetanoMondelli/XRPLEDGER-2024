
#!/bin/bash

source .env

cd bridge
if [ ! -d "hyperlane-monorepo" ]; then
    echo "Directory hyperlane-monorepo does not exist."
    gh repo clone hyperlane-xyz/hyperlane-monorepo
fi


echo "Using KEY: $HYP_KEY"
