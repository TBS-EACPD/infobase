FROM greyltc/archlinux-aur:yay

RUN sudo -u ab -D~ bash -c 'yay -Syu --removemake --needed --noprogressbar --noconfirm \
  git \
  python \
  openssh \
  nodejs-lts-fermium \
  npm \
  mongodb-bin \
  mongosh-bin \
  && yay -Sc # empty caches \
  && pacman -Qtdq | pacman -Rns - # remove orphans'

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}
RUN useradd -m -d ${SERVICE_HOME} -s /sbin/nologin -u 1000 ${SERVICE_USER}
USER ${SERVICE_USER}
VOLUME ${SERVICE_HOME}