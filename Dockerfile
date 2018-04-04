FROM google/cloud-sdk:latest
run curl -sL https://deb.nodesource.com/setup_9.x | bash && \
    apt-get install -y nodejs && \
    apt-get install -y build-essential

