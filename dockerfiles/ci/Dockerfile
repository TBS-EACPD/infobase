FROM archlinux:base-devel

# important to clear the pacman cache as part of the same layer as these installs
RUN sudo pacman --noconfirm -Syu \
  git \
  python \
  bash \
  openssh \
  nodejs-lts-gallium \
  npm \
  && sudo pacman --noconfirm -Sc

# get mongo packages from the extended Arch User Repository. Using the :base-devel base image gives us the
# necessary install dependencies, don't need an aur helper because these are distributed in the .deb format
ENV MAKE_USR non-root
RUN useradd -s /sbin/bash -u 1000 ${MAKE_USR}
RUN for aur_package in mongodb-bin mongosh-bin; do \
    git clone https://aur.archlinux.org/${aur_package}.git \
      && cd ${aur_package} \
      && chown ${MAKE_USR} . \
      && sudo -u ${MAKE_USR} makepkg -s --noconfirm \
      && sudo pacman -U ${aur_package}*.tar.* --noconfirm \
      && cd .. && rm -rf ${aur_package}; \
  done
RUN userdel ${MAKE_USR}

ENV SERVICE_USER service-user
ENV SERVICE_HOME /home/${SERVICE_USER}
RUN useradd -m -d ${SERVICE_HOME} -s /sbin/nologin -u 1000 ${SERVICE_USER}
USER ${SERVICE_USER}
VOLUME ${SERVICE_HOME}