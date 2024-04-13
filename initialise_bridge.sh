
#!/bin/bash

source .env

cd bridge
if [ ! -d "hyperlane-monorepo" ]; then
    echo "Directory hyperlane-monorepo does not exist."
    gh repo clone hyperlane-xyz/hyperlane-monorepo
fi


echo "Using KEY: $HYP_KEY"


export CONFIG_FOLDER=./configs
export ART_FOLDER=./artifacts
export VALIDATOR_SIGNATURES_DIR=./validator_signatures
export DB_RELAYER=./hyperlane_db_relayer
export DB_VALIDATOR=./hyperlane_db_validator


pwd

if [ ! -d "$CONFIG_FOLDER" ]; then
    echo "Directory $CONFIG_FOLDER does not exist."
    exit 1
fi

rustup --version


if [ "$(ls -A $ART_FOLDER)" ]; then
echo "Artifacts folder is not empty. Skipping deploy."
else
echo "Artifacts folder is empty. Deploying."

rm -rf $DB_RELAYER
rm -rf $DB_VALIDATOR

hyperlane deploy core \
    --targets xrpledger,sepolia \
    --chains $CONFIG_FOLDER/chains.yaml \
    --ism $CONFIG_FOLDER/ism.yaml \
    --out $ART_FOLDER \
    --key $HYP_KEY  \
    --yes 
fi



export ARG_FILE=$(ls -t $ART_FOLDER | grep -E "agent-config-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}.json" | head -n 1)

export CONFIG_FILES=$ART_FOLDER/$ARG_FILE

echo $CONFIG_FILES

ls -l $CONFIG_FILES


# Start the first process (validator) in the background
cargo run --release --bin validator -- \
    --db $DB_VALIDATOR \
    --originChainName xrpledger \
    --checkpointSyncer.type localStorage \
    --checkpointSyncer.path $VALIDATOR_SIGNATURES_DIR \
    --validator.key $HYP_KEY &

# # Start the second process (relayer) in the background
cargo run --release --bin relayer -- \
    --db $DB_RELAYER \
    --relayChains xrpledger,sepolia \
    --allowLocalCheckpointSyncers true \
    --defaultSigner.key $HYP_KEY \
    --metrics-port 9091 &


echo "Both processes have finished."

