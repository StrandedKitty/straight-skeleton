# See https://doc.cgal.org/latest/Manual/thirdparty.html which lists CGAL dependencies.

mkdir -p lib/downloads

# ##################################### CGAL #####################################

CGAL_VERSION=5.6
CGAL_NAME=CGAL-$CGAL_VERSION.tar.xz
CGAL_URL=https://github.com/CGAL/cgal/releases/download/v$CGAL_VERSION/$CGAL_NAME

echo "Downloading "$CGAL_NAME
wget -nc -q --show-progress -O lib/downloads/$CGAL_NAME $CGAL_URL
echo "Extracting"
tar -xf lib/downloads/$CGAL_NAME -C lib
echo "Done"

# ##################################### BOOST #####################################

BOOST_VERSION=1.81.0
BOOST_NAME=boost_1_81_0.tar.gz
BOOST_URL=https://boostorg.jfrog.io/artifactory/main/release/$BOOST_VERSION/source/$BOOST_NAME

echo "Downloading "$BOOST_NAME
wget -nc -q --show-progress -O lib/downloads/$BOOST_NAME $BOOST_URL
echo "Extracting"
tar -xf lib/downloads/$BOOST_NAME -C lib
echo "Done"

##################################### GMP #####################################

GMP_VERSION=6.2.1
GMP_NAME=gmp-$GMP_VERSION.tar.xz
GMP_URL=https://gmplib.org/download/gmp/$GMP_NAME

echo "Downloading "$GMP_NAME
wget -nc -q --show-progress -O lib/downloads/$GMP_NAME $GMP_URL
echo "Extracting"
tar -xf lib/downloads/$GMP_NAME -C lib
echo "Done"

##################################### mpfr #####################################

MPFR_VERSION=4.2.0
MPFR_NAME=mpfr-$MPFR_VERSION.tar.xz
MPFR_URL=https://www.mpfr.org/mpfr-$MPFR_VERSION/$MPFR_NAME

echo "Downloading "$MPFR_NAME
wget -nc -q --show-progress -O lib/downloads/$MPFR_NAME $MPFR_URL
echo "Extracting"
tar -xf lib/downloads/$MPFR_NAME -C lib
echo "Done"
