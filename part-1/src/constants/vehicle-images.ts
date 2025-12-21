export const VEHICLE_IMAGES = [
  "https://www.team-bhp.com/sites/default/files/styles/check_extra_large_for_review/public/Ford_0.jpeg",
  "https://spn-sta.spinny.com/blog/20220228132610/Kia-Carnival-first-drive-review-9.jpeg",
  "https://gomechanic.in/blog/wp-content/uploads/2020/06/galleryHome5.jpg",
  "https://www.team-bhp.com/sites/default/files/styles/check_extra_large_for_review/public/creta_13.jpg",
  "https://static-cdn.cars24.com/prod/auto-news24-cms/root/2024/07/22/effe0f8d-5e35-4b9f-aeb5-c3ed778049d9-Tata-Curvv-real-life-image.jpg?w=356&dpr=2.625&optimize=low&format=auto&quality=50",
  "https://spectrum.ieee.org/media-library/swaayatt-robots-suv-with-a-suite-of-sensors-including-lidar-and-gps-on-top-on-a-road-in-india.jpg?id=52091108&width=400&height=266",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTMkM-7GgA1QgW_d-Z7RiGSAfRcCqBxCTu9g&s",
];

export const getRandomVehicleImage = (): string => {
  return VEHICLE_IMAGES[Math.floor(Math.random() * VEHICLE_IMAGES.length)];
};
