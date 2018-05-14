FROM google/cloud-sdk:latest
run curl -sL https://deb.nodesource.com/setup_9.x | bash && \
    apt-get install -y nodejs && \
    apt-get install -y build-essential
RUN apt-get --assume-yes install wget && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get --assume-yes update && \
    apt-get --assume-yes install -y google-chrome-stable
