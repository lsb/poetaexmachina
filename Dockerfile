FROM ruby
RUN apt-get update && \
    apt-get install -y sqlite3 gawk lame && \
    rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/numediart/MBROLA.git && cd MBROLA && which gcc && which make && make && mv Bin/mbrola /usr/bin/
COPY . /poetaexmachina
WORKDIR /poetaexmachina
RUN bundle install
CMD ruby app.rb -p 3000 -e production
