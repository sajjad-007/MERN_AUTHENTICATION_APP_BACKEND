const generateTokenForBrowser = (user, res, statuscode, message) => {
  const token = user.generateJwtToken();
  res
    .status(statuscode)
    .cookie('token', token, {
      expires: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};
module.exports = { generateTokenForBrowser };
