FROM quay.io/centos/centos:stream8

RUN dnf -y update \
 && dnf -y install \
    epel-release \
    python3 \
 && dnf clean all

RUN pip3 install boto3

COPY run-task.py /bin/

RUN chmod +x /bin/run-task.py

CMD ["/bin/run-task.py"]