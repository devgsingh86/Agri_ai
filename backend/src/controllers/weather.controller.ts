import { Request, Response, NextFunction } from 'express';
import { getWeatherForecast } from '../services/weather.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const profileRepo = new ProfileRepository();

/**
 * GET /api/v1/weather
 * Returns a 7-day weather forecast tailored to the user's farm location and crops.
 */
export async function getWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const profile = await profileRepo.findByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: 'Not Found', message: 'Farm profile not found. Complete your profile to get weather forecasts.' });
      return;
    }

    const latitude  = parseFloat(String(profile.latitude  ?? 0));
    const longitude = parseFloat(String(profile.longitude ?? 0));

    if (!profile.latitude || !profile.longitude) {
      res.status(422).json({
        error: 'Unprocessable',
        message: 'GPS coordinates are required for weather forecasts. Update your profile with a GPS location.',
      });
      return;
    }

    // Collect crop names for advisory logic (crops already eager-loaded)
    const cropNames = (profile.crops ?? []).map((c: { crop_name: string }) => c.crop_name);

    const forecast = await getWeatherForecast(latitude, longitude, cropNames);

    res.status(200).json({ data: forecast });
  } catch (err) {
    next(err);
  }
}
