const generateToken = (user, res, statuscode, message) => {
  const token = user.generateJwtToken();
  res
    .status(statuscode)
    .cookie('token', token, {
      expires: new Date(
        Date.now() + process.env.TOKEN_EXPIRE * 24 * 60 * 60 * 1000
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
module.exports = { generateToken };
